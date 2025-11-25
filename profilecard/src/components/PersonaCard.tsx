import React from 'react';
import type { Persona } from '../data/personas';

interface PersonaCardProps {
    persona: Persona;
    index: number;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
    // Deterministic random color based on category
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Marketing: 'bg-pink-100 text-pink-800 border-pink-200',
            Sales: 'bg-blue-100 text-blue-800 border-blue-200',
            Operations: 'bg-green-100 text-green-800 border-green-200',
            'R&D': 'bg-purple-100 text-purple-800 border-purple-200',
            HR: 'bg-orange-100 text-orange-800 border-orange-200',
            Finance: 'bg-slate-100 text-slate-800 border-slate-200',
            IT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            Strategy: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Helper to generate hashtags
    const getHashtags = () => {
        const tags = [`#${persona.role.replace(/\s+/g, '')}`];
        if (persona.personality.techSavvy > 7) tags.push('#TechSavvy');
        if (persona.personality.changeResistance === 'low') tags.push('#EarlyAdopter');
        if (persona.personality.patience > 7) tags.push('#PatientLeader');
        if (persona.team.digitalMaturity === 'Expert') tags.push('#DigitalExpert');
        return tags.slice(0, 3);
    };

    const categoryStyle = getCategoryColor(persona.category);

    return (
        <div className="w-[210mm] h-[297mm] mx-auto p-6 relative overflow-hidden text-sm leading-normal print:break-after-page shadow-2xl mb-8 print:shadow-none print:mb-0 bg-gradient-to-br from-slate-50 to-gray-100">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 h-full flex flex-col">
                {/* Header Section */}
                <div className="flex gap-6 mb-6 border-b pb-4 border-gray-100">
                    {/* Photo Area - Premium Minimalist */}
                    <div className="w-40 h-52 flex-shrink-0 relative group">
                        {/* Soft diffused shadow for depth */}
                        <div className="absolute inset-4 bg-gray-900/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>

                        <img
                            src={`/images/personas/${persona.id}.jpg`}
                            alt={persona.name}
                            className="w-full h-full object-cover rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 relative z-10 transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]"
                            onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).src = `https://i.pravatar.cc/400?u=${persona.id}`;
                            }}
                        />
                    </div>

                    {/* Basic Info Area */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1.5 ${categoryStyle}`}>
                                    {persona.category}
                                </span>
                                <h1 className="text-2xl font-bold text-gray-900 mb-0.5">
                                    {persona.name} <span className="text-base font-normal text-gray-500 ml-2">{persona.role}</span>
                                </h1>
                                <div className="flex gap-2 mt-1 mb-1">
                                    {getHashtags().map(tag => (
                                        <span key={tag} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-base">{persona.company} | {persona.department}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-gray-200 tracking-tighter">{persona.id}</div>
                            </div>
                        </div>

                        {/* Leader Profile Summary (Moved to Header) */}
                        <div className="bg-gray-50 rounded-xl p-3 mt-1 border border-gray-100">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase mb-0.5">Leadership Style</p>
                                    <p className="font-medium text-gray-800 text-xs">{persona.leaderProfile.leadershipStyle}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase mb-0.5">Promotion Reason</p>
                                    <p className="font-medium text-gray-800 text-xs">{persona.leaderProfile.promotionReason}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-6 h-[calc(100%-200px)]">

                    {/* Left Column: Team & Personality (4 cols) */}
                    <div className="col-span-4 flex flex-col gap-5 border-r border-gray-100 pr-5">

                        {/* Team Structure Insight - Scalable (Donut Chart) */}
                        <section>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">Team Structure</h3>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-4">
                                {/* Donut Chart */}
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        {/* Background Circle */}
                                        <path className="text-sky-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                        {/* Senior Segment */}
                                        <path className="text-indigo-600" strokeDasharray={`${(persona.team.seniorCount / persona.team.size) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-[10px] font-bold text-gray-900">{persona.team.size}</span>
                                        <span className="text-[6px] text-gray-400 uppercase">Members</span>
                                    </div>
                                </div>

                                {/* Legend & Insight */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                    <div className="flex justify-between text-[10px]">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                            <span className="text-gray-600">Senior</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{persona.team.seniorCount}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-sky-200"></div>
                                            <span className="text-gray-600">Junior</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{persona.team.juniorCount}</span>
                                    </div>
                                </div>
                            </div>
                        </section>



                        {/* Team Resistance Factors */}
                        < section >
                            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 border-b pb-1 border-red-100">Resistance Factors</h3>
                            <div className="space-y-2">
                                {persona.team.resistanceFactors?.map((factor, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5"></span>
                                        <p className="text-gray-600 text-[10px] leading-tight">{factor}</p>
                                    </div>
                                ))}
                            </div>
                        </section >

                        {/* Personality Radar/Stats */}
                        < section className="flex-1 flex flex-col" >
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">Leader Personality</h3>
                            <div className="flex items-center justify-center relative mb-2">
                                {/* Radar Chart - Compact & Highlighted */}
                                <svg viewBox="0 0 100 100" className="w-32 h-32">
                                    {/* Background Grid */}
                                    {[20, 40, 60, 80].map(r => (
                                        <polygon key={r} points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" transform={`scale(${r / 100})`} style={{ transformOrigin: '50px 50px' }} />
                                    ))}
                                    {/* Axes */}
                                    <line x1="50" y1="50" x2="50" y2="10" stroke="#e2e8f0" strokeWidth="0.5" />
                                    <line x1="50" y1="50" x2="90" y2="40" stroke="#e2e8f0" strokeWidth="0.5" />
                                    <line x1="50" y1="50" x2="75" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
                                    <line x1="50" y1="50" x2="25" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
                                    <line x1="50" y1="50" x2="10" y2="40" stroke="#e2e8f0" strokeWidth="0.5" />

                                    {/* Data Polygon */}
                                    {(() => {
                                        // Normalize values to 0-40 range (radius)
                                        const v1 = (persona.personality.techSavvy / 10) * 40; // Top: Tech
                                        const v2 = (persona.personality.patience / 10) * 40; // Top Right: Patience
                                        const v3 = (persona.personality.changeResistance === 'low' ? 40 : persona.personality.changeResistance === 'medium' ? 25 : 10); // Bottom Right: Adaptability
                                        const v4 = (persona.personality.learningSpeed === 'fast' ? 40 : persona.personality.learningSpeed === 'medium' ? 25 : 10); // Bottom Left: Learning
                                        const v5 = ((persona.personality.confidenceLevel || 5) / 10) * 40; // Top Left: Confidence

                                        // Calculate points
                                        const p1 = `50,${50 - v1}`;
                                        const p2 = `${50 + v2 * 0.95},${50 - v2 * 0.31}`;
                                        const p3 = `${50 + v3 * 0.59},${50 + v3 * 0.81}`;
                                        const p4 = `${50 - v4 * 0.59},${50 + v4 * 0.81}`;
                                        const p5 = `${50 - v5 * 0.95},${50 - v5 * 0.31}`;

                                        return (
                                            <g>
                                                <polygon points={`${p1} ${p2} ${p3} ${p4} ${p5}`} fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="1.5" />
                                                {/* Highlight Points */}
                                                {[p1, p2, p3, p4, p5].map((p, i) => (
                                                    <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="1.5" fill="#4f46e5" />
                                                ))}
                                            </g>
                                        );
                                    })()}

                                    {/* Labels - Compact */}
                                    <text x="50" y="6" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#64748b">Tech</text>
                                    <text x="94" y="38" textAnchor="start" fontSize="5" fontWeight="bold" fill="#64748b">Patience</text>
                                    <text x="77" y="98" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#64748b">Adapt</text>
                                    <text x="23" y="98" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#64748b">Learn</text>
                                    <text x="6" y="38" textAnchor="end" fontSize="5" fontWeight="bold" fill="#64748b">Confid</text>
                                </svg>
                            </div>

                            {/* Bar Charts (Restored) */}
                            <div className="space-y-2 mb-3 px-2">
                                {[
                                    { label: 'Tech Savvy', value: persona.personality.techSavvy, color: 'bg-indigo-500' },
                                    { label: 'Patience', value: persona.personality.patience, color: 'bg-teal-500' },
                                    { label: 'Stress Level', value: persona.personality.stressLevel || 5, color: 'bg-rose-500' },
                                    { label: 'Confidence', value: persona.personality.confidenceLevel || 5, color: 'bg-amber-500' },
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                            <span className="text-gray-600">{stat.label}</span>
                                            <span className="font-medium">{stat.value}/10</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1">
                                            <div className={`h-1 rounded-full ${stat.color}`} style={{ width: `${stat.value * 10}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] border-b border-gray-50 py-1.5">
                                    <span className="text-gray-500">Change Resistance</span>
                                    <span className={`px-1.5 py-0.5 rounded ${persona.personality.changeResistance === 'high' ? 'bg-red-100 text-red-700' :
                                        persona.personality.changeResistance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>{persona.personality.changeResistance.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] border-b border-gray-50 py-1.5">
                                    <span className="text-gray-500">Learning Speed</span>
                                    <span className="font-medium text-gray-800">{persona.personality.learningSpeed.toUpperCase()}</span>
                                </div>
                            </div>
                        </section >

                        {/* Workshop Psychology - Compact */}
                        < section >
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 border-b pb-1">Workshop Mindset</h3>
                            <div className="bg-slate-50/80 backdrop-blur-sm p-2.5 rounded-lg flex items-center justify-between gap-3 border border-slate-100">
                                <div className="flex-1 min-w-0 border-r border-slate-200 pr-3">
                                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-0.5">Initial Attitude</span>
                                    <span className="font-bold text-slate-800 text-xs leading-tight block">
                                        {persona.expectedBehavior.initialAttitude}
                                    </span>
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-end">
                                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-0.5">Dropout Risk</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-10 bg-gray-200 rounded-full h-1">
                                            <div className={`h-1 rounded-full ${persona.expectedBehavior.dropoutRisk > 50 ? 'bg-red-500' :
                                                persona.expectedBehavior.dropoutRisk > 20 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`} style={{ width: `${persona.expectedBehavior.dropoutRisk}%` }}></div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${persona.expectedBehavior.dropoutRisk > 50 ? 'text-red-600' : 'text-gray-700'}`}>{persona.expectedBehavior.dropoutRisk}%</span>
                                    </div>
                                </div>
                            </div>
                        </section >

                    </div >

                    {/* Right Column: Work Details (8 cols) */}
                    < div className="col-span-8 flex flex-col gap-5" >

                        {/* Main Tasks */}
                        < section >
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">Key Responsibilities</h3>
                            <ul className="list-disc list-outside ml-4 space-y-0.5 text-gray-700 text-xs">
                                {persona.work.mainTasks.map((task, i) => (
                                    <li key={i} className="pl-1">{task}</li>
                                ))}
                            </ul>
                        </section >

                        {/* Workflow & Routine - Vertical Flow (N-shape) */}
                        < section className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-sm" >
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Daily Workflow Flow</h3>
                            <div className="flex gap-4 relative">
                                {/* Left Column (AM) */}
                                <div className="flex-1 flex flex-col gap-2 relative">
                                    <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-indigo-100"></div>
                                    {persona.work.dailyWorkflow.split('→').slice(0, Math.ceil(persona.work.dailyWorkflow.split('→').length / 2)).map((step, i) => (
                                        <div key={i} className="relative pl-4">
                                            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-400 z-10"></div>
                                            <p className="text-[10px] text-gray-600 leading-tight bg-white/50 rounded px-1">{step.trim()}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Column (PM) */}
                                <div className="flex-1 flex flex-col gap-2 relative mt-4">
                                    <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-indigo-100"></div>
                                    {persona.work.dailyWorkflow.split('→').slice(Math.ceil(persona.work.dailyWorkflow.split('→').length / 2)).map((step, i) => (
                                        <div key={i} className="relative pl-4">
                                            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm z-10"></div>
                                            <p className="text-[10px] text-gray-600 leading-tight bg-white/50 rounded px-1">{step.trim()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section >

                        {/* Leader's Hidden Struggles & Battery */}
                        < section className="bg-orange-50/80 backdrop-blur-sm p-4 rounded-xl border border-orange-100" >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Leader's Hidden Struggles</h3>
                                {/* Energy Battery */}
                                <div className="flex items-center gap-1" title="Mental Energy Level">
                                    <span className="text-[9px] text-orange-600 font-bold">ENERGY</span>
                                    <div className="w-6 h-3 border border-orange-400 rounded-sm p-0.5 flex items-center">
                                        <div
                                            className={`h-full rounded-[1px] ${persona.expectedBehavior.dropoutRisk > 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.max(10, 100 - persona.expectedBehavior.dropoutRisk)}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-0.5 h-1.5 bg-orange-400 rounded-r-sm"></div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                {persona.leaderProfile.hiddenStruggles?.map((struggle, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <span className="text-orange-400 text-[10px] mt-0.5">💭</span>
                                        <p className="text-orange-900 text-xs italic">{struggle}</p>
                                    </div>
                                ))}
                            </div>
                        </section >

                        {/* Pain Points */}
                        < section >
                            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 border-b pb-1 border-red-100">Pain Points & Struggles</h3>
                            <div className="space-y-2">
                                {persona.work.painPoints.map((point, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                                        <p className="text-gray-700 text-xs">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section >

                        {/* Automation Needs */}
                        < section >
                            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 border-b pb-1 border-blue-100">Automation Needs</h3>
                            <div className="grid grid-cols-1 gap-1.5">
                                {persona.work.automationNeeds.map((need, i) => (
                                    <div key={i} className="bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center">
                                        <svg className="w-3.5 h-3.5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        {need}
                                    </div>
                                ))}
                            </div>
                        </section >

                        {/* Tools */}
                        < section >
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tools Used</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {persona.work.toolsUsed.map((tool, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] border border-gray-200">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </section >

                    </div >
                </div >

                {/* Footer Branding */}
                < div className="absolute bottom-4 right-6 text-right" >
                    <div className="text-[10px] text-gray-300 font-bold tracking-[0.2em] uppercase">Work Redesign Platform</div>
                    <div className="text-[9px] text-gray-300">Persona Card #{persona.id}</div>
                </div >
            </div >
        </div >
    );
};

export default PersonaCard;
