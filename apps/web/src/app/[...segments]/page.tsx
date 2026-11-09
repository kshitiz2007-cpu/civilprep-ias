import { notFound } from "next/navigation";
import { RouteExperience } from "@/components/route-experience";
const known=new Set(["about","our-approach","programs","faculty","resources","current-affairs","editorials","pricing","contact","help","login","register"]);
export default async function RoutedPage({params}:{params:Promise<{segments:string[]}>}){const {segments}=await params;if(!segments.length)notFound();const area=segments[0]==="faculty"?"faculty":segments[0]==="admin"?"admin":segments[0]==="app"?"app":"public";if(area==="public"&&!known.has(segments[0]))notFound();return <RouteExperience area={area} segments={segments.slice(area==="public"?0:1)}/>;}
