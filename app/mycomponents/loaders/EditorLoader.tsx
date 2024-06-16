import { Skeleton } from "~/components/ui/skeleton";

type Props = {};
const EditorLoader = (props: Props) => {
    return (
        <div className="rounded-md p-2">
            <div className="button-group">
                {Array.from({ length: 16 }).map((_, i) => {
                    return (
                        <Skeleton className="h-6 w-12" key={`btn-skt-${i}`} />
                    );
                })}
            </div>
            <Skeleton className="w-full h-[300px] mt-4" />
        </div>
    );
};
export default EditorLoader;
