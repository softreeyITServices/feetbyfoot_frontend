import { AnnouncementService } from "@/domain/application/services/admin/announcement.service";
import { SimpleMarquee } from "@/component/ui/Marquee";

export default async function HomeMarquee() {
  let announcements: Awaited<
    ReturnType<typeof AnnouncementService.getPublic>
  > = [];
  try {
    announcements = await AnnouncementService.getPublic();
  } catch {
    return null;
  }

  const messages = announcements
    .map((a) => a.message.trim())
    .filter(Boolean);
  if (messages.length === 0) return null;

  const text =
    messages.length === 1
      ? messages[0]
      : `${messages.join("   •   ")}   •   `;
  return (
    <SimpleMarquee text={text} announcementCount={messages.length} />
  );
}
