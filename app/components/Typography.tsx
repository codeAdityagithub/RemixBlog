import { ReactNode } from "react";

export function TypographyH1({ children }: { children: ReactNode }) {
    return (
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
            {children}
        </h1>
    );
}
export function TypographyH2({ children }: { children: ReactNode }) {
    return (
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {children}
        </h2>
    );
}

export function TypographyP({ children }: { children: ReactNode }) {
    return <p className="leading-7">{children}</p>;
}
export function TypographyLarge({ children }: { children: ReactNode }) {
    return <div className="text-lg font-semibold">{children}</div>;
}
