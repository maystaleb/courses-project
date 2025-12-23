import { IChapter } from "./ichapter";

export interface ICourse {
    id:string;
    headline:string;
    description:string;
    summary:string[];
    chapters?: IChapter[];
    finished?: boolean;
}
