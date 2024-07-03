import { BellIcon, DotFilledIcon } from "@radix-ui/react-icons";
import {
  Form,
  Link,
  useFetcher,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  BlogNotif,
  OtherNotif,
  action,
  loader,
} from "~/routes/api.notifications";
import { useUser } from "~/utils/general";

type Props = {};
const Notifications = (props: Props) => {
  const user = useUser();
  const navigate = useNavigate();
  const { data, refetch } = useQuery({
    queryKey: ["notifications", user?._id],
    queryFn: async () => {
      // Fetch notifications from the server
      const data = await fetch("/api/notifications").then((res) => res.json());
      // console.log(data);
      return data as ReturnType<typeof loader>;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
  // useEffect(() => {
  //     console.log(data);
  // }, [data]);
  const blogNotifs = useMemo(() => {
    if (!data || !data.blogNotifs) return { read: [], unread: [] };
    return data.blogNotifs.reduce<{
      read: BlogNotif[];
      unread: BlogNotif[];
    }>(
      (acc, item) => {
        if (item.read) {
          acc.read.push(item);
        } else acc.unread.push(item);
        return acc;
      },
      { read: [], unread: [] }
    );
  }, [data]);
  const otherNotifs = useMemo(() => {
    if (!data || !data.otherNotifs) return { read: [], unread: [] };
    return data.otherNotifs.reduce<{
      read: OtherNotif[];
      unread: OtherNotif[];
    }>(
      (acc, item) => {
        if (item.read) {
          acc.read.push(item);
        } else acc.unread.push(item);
        return acc;
      },
      { read: [], unread: [] }
    );
  }, [data]);
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
        <Button
          size="icon"
          variant="ghost"
          className="relative"
        >
          <BellIcon className="w-5 h-5" />
          <span
            className={`${
              blogNotifs.unread.length !== 0 || otherNotifs.unread.length !== 0
                ? "inline "
                : "hidden "
            }absolute w-4 h-4 text-red-500 top-[1px] right-[1px]`}
          >
            <DotFilledIcon />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-1 w-[250px] xs:w-[350px] sm:w-[400px] pb-2">
        <DropdownMenuLabel className="text-lg">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Tabs
          defaultValue="new"
          className="w-full"
        >
          <TabsList className="w-full flex *:flex-1">
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            {blogNotifs.unread.length === 0 &&
            otherNotifs.unread.length === 0 ? (
              <DropdownMenuItem className="justify-center">
                No new notifications
              </DropdownMenuItem>
            ) : null}
            {blogNotifs.unread.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="focus:bg-background"
              >
                <p className="w-full">{notification.notification}</p>
                <Button
                  onClick={(e) => {
                    navigate(notification.link);
                    if (notification.read) return;
                    fetcher.submit(
                      {
                        notificationId: notification._id,
                        type: "blogNotif",
                      },
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

            {otherNotifs.unread.map(
              ({ _id, count, link, read, type, createdAt }) => (
                <DropdownMenuItem
                  key={_id}
                  className="focus:bg-background"
                >
                  <p className="w-full">{getText({ count, type })}</p>
                  <Button
                    onClick={(e) => {
                      navigate(link);
                      if (read) return;
                      fetcher.submit(
                        {
                          notificationId: _id,
                          type: "otherNotif",
                        },
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
              )
            )}
          </TabsContent>
          <TabsContent value="read">
            {blogNotifs.read.length === 0 && otherNotifs.read.length === 0 ? (
              <DropdownMenuItem className="justify-center">
                No new notifications
              </DropdownMenuItem>
            ) : null}
            {blogNotifs.read.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="focus:bg-background"
              >
                <p className="w-full">{notification.notification}</p>
                <Button
                  onClick={(e) => {
                    navigate(notification.link);
                  }}
                  className="ml-2"
                  size="sm"
                  variant="outline"
                >
                  view
                </Button>
              </DropdownMenuItem>
            ))}

            {otherNotifs.read.map(
              ({ _id, count, link, read, type, createdAt }) => (
                <DropdownMenuItem
                  key={_id}
                  className="focus:bg-background"
                >
                  <p className="w-full">{getText({ count, type })}</p>
                  <Button
                    onClick={(e) => {
                      navigate(link);
                    }}
                    className="ml-2"
                    size="sm"
                    variant="outline"
                  >
                    view
                  </Button>
                </DropdownMenuItem>
              )
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function getText({
  count,
  type,
}: {
  count: number;
  type: "comment" | "reply" | "mention";
}) {
  const typeTextMap = {
    comment: { singular: "comment", plural: "comments", context: "blog" },
    reply: { singular: "reply", plural: "replies", context: "comment" },
    mention: { singular: "mention", plural: "mentions", context: "reply" },
  };

  const { singular, plural, context } = typeTextMap[type];
  const typeText = count === 1 ? singular : plural;

  return `You have ${count} ${typeText} on your ${context}.`;
}
export default Notifications;
