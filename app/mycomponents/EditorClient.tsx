import { ClientOnly } from "remix-utils/client-only";
import RichEditor from "./Editor";
import EditorLoader from "./loaders/EditorLoader";
import { Editor } from "@tiptap/react";
type Props = {
    editor: Editor | null;
};
const EditorClient = ({ editor }: Props) => {
    return (
        <ClientOnly fallback={<EditorLoader />}>
            {() => <RichEditor editor={editor} />}
        </ClientOnly>
    );
};
export default EditorClient;
