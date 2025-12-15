import { Lightbulb, Phone, Mail, MapPin, Building, MessageCircle, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { WelcomeConfig, ListItem } from '../../hooks/useWelcomeConfig';

interface KonsultasiSectionProps {
    config: WelcomeConfig['konsultasiSection'];
}

// Color mapping for dynamic contacts
const COLOR_CLASSES = {
    cyan: {
        bg: 'bg-cyan-500',
        bgLight: 'from-cyan-50 to-blue-50',
        border: 'border-cyan-100',
        text: 'text-cyan-700'
    },
    green: {
        bg: 'bg-green-500',
        bgLight: 'from-green-50 to-emerald-50',
        border: 'border-green-100',
        text: 'text-green-700'
    },
    orange: {
        bg: 'bg-orange-500',
        bgLight: 'from-orange-50 to-red-50',
        border: 'border-orange-100',
        text: 'text-orange-700'
    },
    blue: {
        bg: 'bg-blue-500',
        bgLight: 'from-blue-50 to-indigo-50',
        border: 'border-blue-100',
        text: 'text-blue-700'
    },
    purple: {
        bg: 'bg-purple-500',
        bgLight: 'from-purple-50 to-pink-50',
        border: 'border-purple-100',
        text: 'text-purple-700'
    },
    pink: {
        bg: 'bg-pink-500',
        bgLight: 'from-pink-50 to-rose-50',
        border: 'border-pink-100',
        text: 'text-pink-700'
    },
    red: {
        bg: 'bg-red-500',
        bgLight: 'from-red-50 to-orange-50',
        border: 'border-red-100',
        text: 'text-red-700'
    }
} as const;

// Helper to get Lucide icon by name
function getIconComponent(iconName: string): LucideIcon {
    // Try to find icon in lucide-react dynamically
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) return IconComponent;

    // Fallback icons based on common patterns
    if (iconName.toLowerCase().includes('phone')) return Phone;
    if (iconName.toLowerCase().includes('mail') || iconName.toLowerCase().includes('email')) return Mail;
    if (iconName.toLowerCase().includes('map') || iconName.toLowerCase().includes('location')) return MapPin;
    if (iconName.toLowerCase().includes('message')) return MessageCircle;
    if (iconName.toLowerCase().includes('building')) return Building;
    if (iconName.toLowerCase().includes('globe') || iconName.toLowerCase().includes('web')) return Globe;

    // Default fallback
    return Phone;
}

export function KonsultasiSection({ config }: KonsultasiSectionProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 bg-gradient-to-r from-[#419823] to-[#2f7d1a] -mx-6 -mt-6 p-6 rounded-t-xl text-white">
                <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
                <p className="text-white/85 text-sm">{config.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Layanan Konsultasi */}
                {config.cards.layananKonsultasi.enabled && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-[#419823]/10 flex items-center justify-center">
                                <Lightbulb className="h-5 w-5 text-[#419823]" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.layananKonsultasi.title}</h3>
                        </div>
                        {config.cards.layananKonsultasi.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.layananKonsultasi.items.map((item, index) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 h-6 w-6 rounded-full bg-[#419823] flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-semibold">{index + 1}</span>
                                            </div>
                                            <span className="text-slate-700 text-sm">{listItem.text}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Belum ada item</p>
                        )}
                    </div>
                )}

                {/* Hubungi Kami - Dynamic Contacts */}
                {config.cards.hubungiKami.enabled && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-[#F4D348]/25 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-slate-900" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.hubungiKami.title}</h3>
                        </div>
                        {config.cards.hubungiKami.contacts.length > 0 ? (
                            <div className="space-y-4">
                                {config.cards.hubungiKami.contacts
                                    .filter(contact => contact.enabled)
                                    .map((contact) => {
                                        const colorClasses = COLOR_CLASSES[contact.color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.cyan;
                                        const IconComponent = getIconComponent(contact.icon || 'Phone');

                                        return (
                                            <div
                                                key={contact.id}
                                                className={`flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r ${colorClasses.bgLight} border ${colorClasses.border}`}
                                            >
                                                <div className={`h-10 w-10 rounded-full ${colorClasses.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <IconComponent className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-semibold ${colorClasses.text} mb-1`}>{contact.label}</p>
                                                    <p className="text-sm text-slate-800 font-medium">{contact.value}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Belum ada kontak</p>
                        )}

                        {config.cards.hubungiKami.buttonEnabled && (
                            <button className="mt-6 w-full rounded-lg bg-[#419823] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2f7d1a] transition-all">
                                {config.cards.hubungiKami.buttonText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
