"use client";

import React from "react";

interface TabsListProps {
    className?: string;
    children: React.ReactNode;
}

interface TabsTriggerProps {
    value: string;
    className?: string;
    children: React.ReactNode;
    isActive?: boolean;
    onClick?: () => void;
}

interface TabsContentProps {
    value: string;
    className?: string;
    children: React.ReactNode;
    activeTab?: string;
}

export function TabsList({ className, children }: TabsListProps) {
    return (
        <div className={`flex ${className}`}>
            {children}
        </div>
    );
}

export function TabsTrigger({ className, children, onClick }: TabsTriggerProps) {
    return (
        <button
            className={className}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, className, children, activeTab }: TabsContentProps) {
    if (value !== activeTab) {
        return null;
    }

    return (
        <div className={className}>
            {children}
        </div>
    );
}