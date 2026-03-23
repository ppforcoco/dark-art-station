'use client';
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
```

---

**Option B — Remove the import from layout.tsx (quick fix)**

If you can't add files via GitHub UI, edit `app/layout.tsx` and remove these two lines:
```
import ScrollReset from "@/components/ScrollReset";
```

and
```
<ScrollReset />
