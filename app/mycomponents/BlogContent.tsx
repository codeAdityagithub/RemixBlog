import React from "react";
import {
    TypographyH2,
    TypographyLarge,
    TypographyP,
} from "~/components/Typography";
import { Content } from "~/models/Schema.server";

type Props = Content;

const BlogContent = ({ content, heading, image }: Props) => {
    return (
        <div id={heading} className="flex flex-col gap-4 border-b pb-4">
            <TypographyH2>{heading}</TypographyH2>
            <img
                alt="Blog Post Image"
                className="w-full h-48 object-cover rounded-sm"
                height={360}
                src={image}
                style={{
                    aspectRatio: "640/360",
                    objectFit: "cover",
                }}
                width={640}
            />
            <div className="px-4">
                <TypographyP>{content}</TypographyP>
            </div>
        </div>
    );
};

export default BlogContent;
