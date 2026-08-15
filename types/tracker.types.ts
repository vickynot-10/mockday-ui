export interface TrackerForm {
  company: string;
  title: string;
  url: string;
  description: string;
  page_title: string;
  h1: string;
  site_name: string;
  status:string | null;
  notes: string[];
}