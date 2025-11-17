import mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import * as xlsx from 'xlsx';
import { promises as fs } from 'fs';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('DocumentProcessor');

export class DocumentProcessor {
  static async parseDocument(filePath: string, mimeType: string): Promise<string> {
    logger.info(`📄 Starting document parsing: ${filePath}`);

    try {
      if (mimeType.includes('wordprocessingml')) {
        return await this.parseDocx(filePath);
      } else if (mimeType.includes('pdf')) {
        return await this.parsePdf(filePath);
      } else if (mimeType.includes('spreadsheet') || mimeType.includes('ms-excel')) {
        return await this.parseExcel(filePath);
      } else if (mimeType.includes('text/plain') || mimeType.includes('text/')) {
        return await this.parseText(filePath);
      } else if (mimeType.includes('hwp') || filePath.toLowerCase().endsWith('.hwp')) {
        return await this.parseHwp(filePath);
      } else if (mimeType === 'application/octet-stream' && filePath.toLowerCase().endsWith('.hwp')) {
        // Handle HWP files uploaded as binary
        return await this.parseHwp(filePath);
      }

      throw new Error(`지원하지 않는 파일 형식: ${mimeType}`);

    } catch (error) {
      logger.error('Document parsing error:', error);
      throw new Error(`문서 파싱 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private static async parseDocx(filePath: string): Promise<string> {
    try {
      logger.debug('Parsing DOCX file');
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });

      if (!result.value) {
        throw new Error('DOCX 파일에서 텍스트를 추출할 수 없습니다');
      }

      logger.info(`✅ DOCX parsing completed, extracted ${result.value.length} characters`);
      return result.value;
    } catch (error) {
      logger.error('DOCX parsing error:', error);
      throw new Error(`DOCX 파일 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private static async parsePdf(filePath: string): Promise<string> {
    try {
      logger.debug('Parsing PDF file');
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse.default(buffer);

      if (!data.text) {
        throw new Error('PDF 파일에서 텍스트를 추출할 수 없습니다');
      }

      logger.info(`✅ PDF parsing completed, extracted ${data.text.length} characters`);
      return data.text;
    } catch (error) {
      logger.error('PDF parsing error:', error);
      throw new Error(`PDF 파일 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private static async parseExcel(filePath: string): Promise<string> {
    try {
      logger.debug('Parsing Excel file');
      const workbook = xlsx.readFile(filePath);
      let text = '';

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Excel 파일에 시트가 없습니다');
      }

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          logger.warn(`Sheet "${sheetName}" is empty or could not be read`);
          return;
        }

        try {
          const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
          text += `\n[${sheetName}]\n`;
          text += json
            .filter((row: any) => row && row.length > 0)
            .map((row: any) => row.join(' | '))
            .join('\n');
        } catch (sheetError) {
          logger.warn(`Error processing sheet "${sheetName}":`, sheetError);
        }
      });

      if (!text.trim()) {
        throw new Error('Excel 파일에서 텍스트를 추출할 수 없습니다');
      }

      logger.info(`✅ Excel parsing completed, extracted ${text.length} characters from ${workbook.SheetNames.length} sheets`);
      return text;
    } catch (error) {
      logger.error('Excel parsing error:', error);
      throw new Error(`Excel 파일 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private static async parseText(filePath: string): Promise<string> {
    try {
      logger.debug('Parsing text file with encoding detection');

      // Try to read with UTF-8 first
      let text: string;
      try {
        text = await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        // If UTF-8 fails, try with different encodings
        try {
          logger.debug('UTF-8 failed, trying with latin1 encoding');
          const buffer = await fs.readFile(filePath);
          text = buffer.toString('utf-8');

          // Check if the text looks corrupted (contains replacement characters)
          if (text.includes('�') || text.includes('\uFFFD')) {
            logger.debug('UTF-8 seems corrupted, trying EUC-KR simulation');
            // For Korean text files that might be in EUC-KR encoding
            text = buffer.toString('latin1');
          }
        } catch (fallbackError) {
          logger.warn('Fallback encoding also failed:', fallbackError);
          throw error; // Re-throw the original error
        }
      }

      if (!text.trim()) {
        throw new Error('텍스트 파일이 비어있습니다');
      }

      logger.info(`✅ Text parsing completed, extracted ${text.length} characters`);
      return text;
    } catch (error) {
      logger.error('Text parsing error:', error);
      throw new Error(`텍스트 파일 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private static async parseHwp(filePath: string): Promise<string> {
    try {
      logger.debug('Parsing HWP file');

      // HWP files are binary format, so we'll try a basic text extraction approach
      // Note: This is a simplified approach. For full HWP support, you would need
      // a specialized library like hwp.js or conversion via LibreOffice
      const buffer = await fs.readFile(filePath);

      // Try to extract readable Korean text from the binary data
      // HWP files contain text in various encodings, this is a basic attempt
      let text = '';

      // Convert buffer to string with different encodings and extract Korean text
      const utf8Text = buffer.toString('utf-8');
      const latin1Text = buffer.toString('latin1');

      // Extract Korean characters (Hangul) from the text
      const koreanRegex = /[가-힣]+/g;
      const koreanMatches = utf8Text.match(koreanRegex) || latin1Text.match(koreanRegex) || [];

      // Also extract ASCII text (English, numbers, punctuation)
      const asciiRegex = /[a-zA-Z0-9\s\.,!?;:(){}[\]"'-]+/g;
      const asciiMatches = utf8Text.match(asciiRegex) || [];

      // Combine extracted text
      const allText = [...koreanMatches, ...asciiMatches]
        .filter(match => match.trim().length > 1) // Filter out single characters
        .join(' ');

      if (!allText.trim()) {
        // Fallback: show a warning but allow processing to continue
        logger.warn('HWP 파일에서 텍스트를 추출할 수 없습니다. LibreOffice나 전용 HWP 변환 도구 사용을 권장합니다.');
        text = '⚠️ HWP 파일이 업로드되었습니다. 완전한 텍스트 추출을 위해서는 파일을 DOCX나 PDF로 변환하여 업로드해주세요.\n\n' +
               '파일명: ' + filePath.split('/').pop() + '\n' +
               '크기: ' + Math.round(buffer.length / 1024) + 'KB\n\n' +
               '이 파일은 업무 분석에 포함되지만, 텍스트 추출이 제한적일 수 있습니다.';
      } else {
        text = '📄 HWP 파일에서 추출된 텍스트 (부분적일 수 있음):\n\n' + allText;
      }

      logger.info(`✅ HWP parsing completed, extracted ${text.length} characters`);
      return text;
    } catch (error) {
      logger.error('HWP parsing error:', error);
      throw new Error(`HWP 파일 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  static validateFileType(mimetype: string): boolean {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/plain', // .txt
      'application/x-hwp', // .hwp (Korean word processor)
      'application/haansofthwp', // Another .hwp MIME type
      'application/vnd.hancom.hwp', // HWP variation
      'application/octet-stream' // Generic binary (might be HWP files uploaded as binary)
    ];

    return allowedTypes.includes(mimetype) ||
           mimetype.startsWith('text/') ||
           mimetype.includes('hwp'); // Catch any HWP variations
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isValidFileExtension(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    const allowedExts = ['docx', 'pdf', 'xlsx', 'xls', 'txt', 'hwp'];
    return allowedExts.includes(ext);
  }
}