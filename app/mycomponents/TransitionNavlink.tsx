import {
  LinkProps,
  NavLink,
  NavLinkProps,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { MouseEvent, ReactNode } from "react";

const TransitionNavlink = ({
  children,
  querySelector = "#mainPage",
  ...props
}: NavLinkProps & { children: ReactNode; querySelector?: string }) => {
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
    <NavLink
      onClick={transition}
      {...props}
    >
      {children}
    </NavLink>
  );
};
export default TransitionNavlink;
