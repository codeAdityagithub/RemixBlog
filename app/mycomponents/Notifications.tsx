import { BellIcon, DotFilledIcon } from "@radix-ui/react-icons";
import {
    Form,
    Link,
    useFetcher,
    useNavigate,
    useSubmit,
} from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { action, loader } from "~/routes/api.notifications";
import { useUser } from "~/utils/general";

type Props = {};
const Notifications = (props: Props) => {
    const user = useUser();
    const navigate = useNavigate();
    const { data, refetch } = useQuery({
        queryKey: ["notifications", user?._id],
        queryFn: async () => {
            // Fetch notifications from the server
            const data = await fetch("/api/notifications").then((res) =>
                res.json()
            );
            return data as ReturnType<typeof loader>;
        },
        staleTime: 1000 * 60, // 5 minutes
        refetchInterval: 1000 * 60, // 5 minutes
    });
    // console.log(data);
    const fetcher = useFetcher<typeof action>();
    useEffect(() => {
        if (fetcher.data?.ok) {
            refetch();
        }
    }, [fetcher.data]);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                asChild
                className="flex items-center justify-center"
            >
                <Button size="icon" variant="ghost" className="relative">
                    <BellIcon />
                    <span
                        className={`absolute w-4 h-4 text-red-500 top-0.5 right-0.5`}
                    >
                        <DotFilledIcon />
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-1 max-w-xs">
                <DropdownMenuLabel>Your Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {data?.notifications.map((notification) => (
                    <DropdownMenuItem className="focus:bg-background">
                        <p className="w-full">{notification.notification}</p>
                        <Button
                            onClick={(e) => {
                                navigate(notification.link);
                                if (notification.read) return;
                                fetcher.submit(
                                    { notificationId: notification._id },
                                    {
                                        method: "POST",
                                        action: "/api/notifications",
                                    }
                                );
                            }}
                            className="ml-2"
                            size="sm"
                            variant="outline"
                        >
                            view
                        </Button>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default Notifications;
