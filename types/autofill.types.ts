export type FieldRule = {
  label: string;
  values: string[];
};

export type Experience = {
  point: string;
  start_date: string;
  end_date: string | null;
  currently_working_on: boolean;
};

export type FormValues = {
  email: string;
  phone: string;
  experience: Experience[];
  custom_rules: FieldRule[];
  about_you: string;
};