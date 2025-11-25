import React from 'react';
import type { Persona } from '../data/personas';

interface PersonaCardProps {
    persona: Persona;
    index: number;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, index }) => {
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

    const categoryStyle = getCategoryColor(persona.category);

    return (
        <div className="w-[210mm] h-[297mm] bg-white mx-auto p-8 relative overflow-hidden text-sm leading-relaxed print:break-after-page shadow-xl mb-8 print:shadow-none print:mb-0">
            {/* Header Section */}
            <div className="flex gap-8 mb-8 border-b pb-6 border-gray-100">
                {/* Photo Area */}
                <div className="w-48 h-48 flex-shrink-0">
                    <img
                        src={['P001', 'P002', 'P003', 'P004', 'P005'].includes(persona.id) ? `/images/${persona.id}.jpg` : `https://i.pravatar.cc/400?u=${persona.id}`}
                        alt={persona.name}
                        className="w-full h-full object-cover rounded-2xl shadow-sm bg-gray-50"
                    />
                </div>

                {/* Basic Info Area */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${categoryStyle}`}>
                                {persona.category}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {persona.name} <span className="text-lg font-normal text-gray-500 ml-2">{persona.role}</span>
                            </h1>
                            <p className="text-gray-600 text-lg">{persona.company} | {persona.department}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-gray-900">{persona.age}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Age</div>
                        </div>
                    </div>

                    {/* Leader Profile Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mt-2 border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Leadership Style</p>
                                <p className="font-medium text-gray-800">{persona.leaderProfile.leadershipStyle}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Promotion Reason</p>
                                <p className="font-medium text-gray-800 line-clamp-2">{persona.leaderProfile.promotionReason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8 h-[calc(100%-240px)]">

                {/* Left Column: Team & Personality (4 cols) */}
                <div className="col-span-4 flex flex-col gap-6 border-r border-gray-100 pr-6">

                    {/* Team Stats */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">Team Composition</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                                <span className="text-blue-900 font-medium">Total Size</span>
                                <span className="text-2xl font-bold text-blue-600">{persona.team.size}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-xs text-gray-500">Senior</div>
                                    <div className="font-bold text-gray-900">{persona.team.seniorCount}</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <div className="text-xs text-gray-500">Junior</div>
                                    <div className="font-bold text-gray-900">{persona.team.juniorCount}</div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Digital Maturity</p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${persona.team.digitalMaturity === 'Expert' ? 'bg-green-500 w-full' :
                                            persona.team.digitalMaturity === 'Advanced' ? 'bg-blue-500 w-3/4' :
                                                persona.team.digitalMaturity === 'Intermediate' ? 'bg-yellow-500 w-1/2' :
                                                    'bg-red-500 w-1/4'
                                            }`}
                                    ></div>
                                </div>
                                <p className="text-right text-xs font-medium mt-1 text-gray-600">{persona.team.digitalMaturity}</p>
                            </div>
                        </div>
                    </section>

                    {/* Personality Radar/Stats */}
                    <section className="flex-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">Leader Personality</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Tech Savvy', value: persona.personality.techSavvy, color: 'bg-indigo-500' },
                                { label: 'Patience', value: persona.personality.patience, color: 'bg-teal-500' },
                                { label: 'Stress Level', value: persona.personality.stressLevel || 5, color: 'bg-rose-500' },
                                { label: 'Confidence', value: persona.personality.confidenceLevel || 5, color: 'bg-amber-500' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">{stat.label}</span>
                                        <span className="font-medium">{stat.value}/10</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${stat.color}`} style={{ width: `${stat.value * 10}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between items-center text-xs border-b border-gray-50 py-2">
                                <span className="text-gray-500">Change Resistance</span>
                                <span className={`px-2 py-0.5 rounded ${persona.personality.changeResistance === 'high' ? 'bg-red-100 text-red-700' :
                                    persona.personality.changeResistance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>{persona.personality.changeResistance.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-b border-gray-50 py-2">
                                <span className="text-gray-500">Learning Speed</span>
                                <span className="font-medium text-gray-800">{persona.personality.learningSpeed.toUpperCase()}</span>
                            </div>
                        </div>
                    </section>

                    {/* Workshop Psychology */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">Workshop Mindset</h3>
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="mb-2">
                                <span className="text-xs text-gray-500 block">Initial Attitude</span>
                                <span className="font-bold text-slate-800 text-lg">{persona.expectedBehavior.initialAttitude}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-xs text-gray-500 block">Dropout Risk</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${persona.expectedBehavior.dropoutRisk > 50 ? 'bg-red-500' :
                                            persona.expectedBehavior.dropoutRisk > 20 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`} style={{ width: `${persona.expectedBehavior.dropoutRisk}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold">{persona.expectedBehavior.dropoutRisk}%</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Right Column: Work Details (8 cols) */}
                <div className="col-span-8 flex flex-col gap-6">

                    {/* Main Tasks */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">Key Responsibilities</h3>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
                            {persona.work.mainTasks.slice(0, 4).map((task, i) => (
                                <li key={i} className="pl-1">{task}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Workflow & Routine */}
                    <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Daily Workflow</h3>
                        <p className="text-gray-700 italic leading-relaxed">"{persona.work.dailyWorkflow}"</p>
                    </section>

                    {/* Pain Points */}
                    <section>
                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 border-b pb-1 border-red-100">Pain Points & Struggles</h3>
                        <div className="space-y-3">
                            {persona.work.painPoints.slice(0, 3).map((point, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                                    <p className="text-gray-700">{point}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Automation Needs */}
                    <section>
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 border-b pb-1 border-blue-100">Automation Needs</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {persona.work.automationNeeds.map((need, i) => (
                                <div key={i} className="bg-blue-50 text-blue-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    {need}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tools */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tools Used</h3>
                        <div className="flex flex-wrap gap-2">
                            {persona.work.toolsUsed.map((tool, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </section>

                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-6 right-8 text-right">
                <div className="text-xs text-gray-300 font-bold tracking-[0.2em] uppercase">Work Redesign Platform</div>
                <div className="text-[10px] text-gray-300">Persona Card #{persona.id}</div>
            </div>
        </div>
    );
};

export default PersonaCard;
