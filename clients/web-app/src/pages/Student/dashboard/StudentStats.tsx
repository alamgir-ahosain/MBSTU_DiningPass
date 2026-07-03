import { Stat } from "@/components/Stat";

export function StudentStats({ activeTokens }: { activeTokens: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-8 max-w-xs">
            <Stat label="Active Tokens" value={activeTokens} />
        </div>
    );
}