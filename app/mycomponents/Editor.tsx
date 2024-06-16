import { ClientOnly } from "remix-utils/client-only";
import RichEditor from "./Editor.client";
import EditorLoader from "./loaders/EditorLoader";
type Props = {};
const Editor = (props: Props) => {
    return (
        <ClientOnly fallback={<EditorLoader />}>
            {() => <RichEditor />}
        </ClientOnly>
    );
};
export default Editor;
