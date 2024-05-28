import { singleton } from "./singleton.client";

const cachedReplies = singleton("cachedReplies", () => new Map());

export default cachedReplies;
