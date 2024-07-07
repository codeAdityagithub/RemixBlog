import {
  ArchiveIcon,
  EyeOpenIcon,
  HeartFilledIcon,
  HeartIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { useFetcher } from "@remix-run/react";
import copy from "copy-to-clipboard";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useToast } from "~/components/ui/use-toast";
import { loader } from "~/routes/blogs.$blogId.engagements";
import BlogCommentsSheet from "./BlogCommentsSheet";
import EngagementLoader from "./loaders/EngagementLoader";

// type Props = {
//     likes: number;
//     views: number;
//     _id: string;
//     liked: boolean;
//     comments: number;
// };

const BlogEngagement = () => {
  const engLoader = useFetcher<typeof loader>();
  const fetcher = useFetcher();
  const { toast } = useToast();
  const [engagements, setEngagements] = useState<typeof engLoader.data>();
  const copytoClipboard = () => {
    const copied = copy(`${window.location.href}`);
    if (copied) {
      toast({ description: "URL copied successfully" });
    }
  };
  useEffect(() => {
    engLoader.load("engagements");
  }, []);

  useEffect(() => {
    if (engLoader.data) setEngagements(engLoader.data);
  }, [engLoader.data]);

  useEffect(() => {
    if (fetcher.formData?.get("_action") === "like") {
      // likes = liked ? likes - 1 : likes + 1;
      // liked = !liked;
      setEngagements((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: prev.likes + (prev.liked ? -1 : 1),
          liked: !prev.liked,
        };
      });
    }
  }, [fetcher.formData]);
  return (
    <div className="flex justify-between w-full border-t border-b border-border py-2">
      {engagements ? (
        <>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex gap-2 items-center"
                  >
                    <EyeOpenIcon />
                    {engagements.views}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blog views</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <fetcher.Form
                    action="engagements"
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="_action"
                      value="like"
                    />
                    <Button
                      // onClick={likeBlog}
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="flex gap-2 items-center"
                    >
                      {engagements.liked ? (
                        <HeartFilledIcon className="animate-heart" />
                      ) : (
                        <HeartIcon />
                      )}{" "}
                      <span>{engagements.likes}</span>
                    </Button>
                  </fetcher.Form>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Like the blog</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <BlogCommentsSheet comments={engagements.comments} />
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  onClick={copytoClipboard}
                  asChild
                >
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    <Share1Icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      ) : (
        <EngagementLoader />
      )}
    </div>
  );
};

export default BlogEngagement;
