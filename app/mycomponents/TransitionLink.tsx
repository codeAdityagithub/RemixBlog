import { Link, LinkProps, useLocation, useNavigate } from "@remix-run/react";
import { MouseEvent, ReactNode, useRef } from "react";

const TransitionLink = ({
  children,
  querySelector = "#mainPage",
  ...props
}: LinkProps & { children: ReactNode; querySelector?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function transition(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    if (props.to === location.pathname) return;
    const body = document.querySelector(querySelector);
    body?.classList.add("page-transition");
    navigate(props.to);
    await sleep(200);
    body?.classList.remove("page-transition");
  }
  return (
    <Link
      onClick={transition}
      {...props}
    >
      {children}
    </Link>
  );
};
export default TransitionLink;
