import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

type Props = {
    cardTitle: string;
    cardValue: number;
    cardIcon: ReactNode;
};

const DashboardAnalyticCard = ({ cardIcon, cardTitle, cardValue }: Props) => {
    return (
        <Card className="h-min">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {cardTitle}
                </CardTitle>
                {cardIcon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{cardValue}</div>
            </CardContent>
        </Card>
    );
};

export default DashboardAnalyticCard;
