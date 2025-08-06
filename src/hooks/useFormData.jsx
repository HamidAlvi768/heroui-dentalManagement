import react from "react";
import { useMemo } from "react";

export default function useFormData() {
  return useMemo(() => {
    const saved = localStorage.getItem("formData");
    return saved
      ? JSON.parse(saved)
      : {
          websiteName: "JDent Lite",
          logo: 'https://api.iconify.design/lucide:activity.svg?width=32&height=32&color=white',

        };
  }, []);
}
