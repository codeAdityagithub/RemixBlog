import { AvatarIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { useUser } from "~/utils/general";

type Props = {
    totalBlogs: number;
    followers: number;
    following: number;
};

const Dashboarduser = ({ totalBlogs, followers, following }: Props) => {
    const user = useUser()!;
    // console.log(user);
    return (
        <Card className="h-full flex flex-col gap-2">
            <CardHeader className="flex flex-col relative items-center">
                <Avatar className="h-24 w-24">
                    <AvatarImage
                        width={96}
                        height={96}
                        alt={user.username}
                        src={user.picture}
                    ></AvatarImage>
                    <AvatarFallback>
                        <AvatarIcon
                            className="w-full h-full"
                            style={{ margin: 0 }}
                        />
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-medium">
                    {user?.username}
                </CardTitle>
                <CardDescription>Author/Writer</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 md:flex-col *:w-full *:justify-start *:md:gap-8 items-center flex-1">
                <div className="text-xl font-bold flex-1 flex flex-col items-center sm:flex-row sm:gap-2 ">
                    <p className="flex-1">{totalBlogs} </p>
                    <div className="text-muted-foreground text-sm flex-[4]">
                        Total Blogs
                    </div>
                </div>
                <div className="text-xl font-bold flex-1 flex flex-col items-center sm:flex-row sm:gap-2 ">
                    <p className="flex-1">{followers} </p>
                    <div className="text-muted-foreground text-sm flex-[4]">
                        Followers
                    </div>
                </div>
                <div className="text-xl font-bold flex-1 flex flex-col items-center sm:flex-row sm:gap-2 ">
                    <p className="flex-1">{following} </p>
                    <div className="text-muted-foreground text-sm flex-[4]">
                        Following
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Dashboarduser;
