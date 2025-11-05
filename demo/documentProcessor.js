const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

class DocumentProcessor {
  constructor() {
    this.setupUpload();
  }

  setupUpload() {
    // Configure multer for file uploads
    const storage = multer.memoryStorage();

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Max 10 files per upload
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
          'application/pdf', // PDF
          'text/plain', // TXT
          'text/csv', // CSV
          'application/json' // JSON
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`지원하지 않는 파일 형식입니다: ${file.mimetype}`), false);
        }
      }
    });
  }

  getUploadMiddleware() {
    return this.upload.array('files', 10);
  }

  async processFiles(files) {
    const results = [];

    for (const file of files) {
      try {
        const content = await this.processFile(file);
        results.push({
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          content: content,
          status: 'success'
        });
      } catch (error) {
        console.error(`파일 처리 오류 (${file.originalname}):`, error);
        results.push({
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          content: '',
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  async processFile(file) {
    console.log(`파일 처리 시작: ${file.originalname} (${file.mimetype})`);

    switch (file.mimetype) {
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.parseDocx(file.buffer);

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return await this.parseXlsx(file.buffer);

      case 'application/pdf':
        return await this.parsePdf(file.buffer);

      case 'text/plain':
      case 'text/csv':
        return file.buffer.toString('utf-8');

      case 'application/json':
        return JSON.stringify(JSON.parse(file.buffer.toString('utf-8')), null, 2);

      default:
        throw new Error(`지원하지 않는 파일 형식: ${file.mimetype}`);
    }
  }

  async parseDocx(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer: buffer });

      if (result.messages.length > 0) {
        console.log('DOCX 변환 메시지:', result.messages);
      }

      return result.value || '';
    } catch (error) {
      throw new Error(`DOCX 파일 파싱 오류: ${error.message}`);
    }
  }

  async parseXlsx(buffer) {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let allText = '';

      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        allText += `=== ${sheetName} 시트 ===\n`;

        jsonData.forEach((row, rowIndex) => {
          if (row.length > 0) {
            const rowText = row.map(cell => cell?.toString() || '').join('\t');
            if (rowText.trim()) {
              allText += `${rowIndex + 1}: ${rowText}\n`;
            }
          }
        });

        allText += '\n';
      });

      return allText;
    } catch (error) {
      throw new Error(`XLSX 파일 파싱 오류: ${error.message}`);
    }
  }

  async parsePdf(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (error) {
      throw new Error(`PDF 파일 파싱 오류: ${error.message}`);
    }
  }

  // 문서 내용을 분석용으로 전처리
  preprocessContent(content) {
    if (!content) return '';

    return content
      .replace(/\s+/g, ' ') // 여러 공백을 하나로
      .replace(/\n\s*\n/g, '\n') // 빈 줄 정리
      .trim();
  }

  // 업무 관련 키워드 추출
  extractWorkKeywords(content) {
    const keywords = {
      processes: [],
      tools: [],
      tasks: [],
      data: []
    };

    const processPatterns = [
      /업무\s*프로세스/g, /워크플로우?/g, /절차/g, /과정/g, /단계/g
    ];

    const toolPatterns = [
      /엑셀/g, /Excel/gi, /PowerPoint/gi, /파워포인트/g, /Word/gi, /워드/g,
      /SQL/gi, /Python/gi, /JavaScript/gi, /API/gi, /데이터베이스/g, /DB/gi
    ];

    const taskPatterns = [
      /보고서\s*작성/g, /데이터\s*분석/g, /회의/g, /미팅/g, /검토/g, /승인/g,
      /취합/g, /정리/g, /관리/g, /모니터링/g, /추적/g
    ];

    const dataPatterns = [
      /고객\s*데이터/g, /매출\s*데이터/g, /성과\s*데이터/g, /로그\s*데이터/g,
      /분석\s*결과/g, /통계/g, /지표/g, /KPI/gi
    ];

    // 키워드 추출
    processPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) keywords.processes.push(...matches);
    });

    toolPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) keywords.tools.push(...matches);
    });

    taskPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) keywords.tasks.push(...matches);
    });

    dataPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) keywords.data.push(...matches);
    });

    // 중복 제거
    Object.keys(keywords).forEach(key => {
      keywords[key] = [...new Set(keywords[key])];
    });

    return keywords;
  }

  // 파일 검증
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('파일이 없습니다.');
      return errors;
    }

    if (file.size === 0) {
      errors.push('빈 파일입니다.');
    }

    if (file.size > 50 * 1024 * 1024) {
      errors.push('파일 크기가 50MB를 초과합니다.');
    }

    const allowedExtensions = ['.docx', '.xlsx', '.pdf', '.txt', '.csv', '.json'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`지원하지 않는 파일 확장자입니다: ${fileExtension}`);
    }

    return errors;
  }

  // 처리 결과 요약
  generateProcessingSummary(results) {
    const summary = {
      totalFiles: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      totalSize: results.reduce((sum, r) => sum + r.size, 0),
      fileTypes: [...new Set(results.map(r => r.mimetype))],
      extractedContent: results
        .filter(r => r.status === 'success')
        .map(r => r.content)
        .join('\n\n'),
      keywords: {}
    };

    // 전체 텍스트에서 키워드 추출
    if (summary.extractedContent) {
      summary.keywords = this.extractWorkKeywords(summary.extractedContent);
    }

    return summary;
  }
}

module.exports = DocumentProcessor;