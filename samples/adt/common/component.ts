import { Adtcore } from "./adtcore";
import { AtomLink } from "./atom";

export type Component<T> = T &
{
    adtcore: Adtcore;
    links: AtomLink[];
}