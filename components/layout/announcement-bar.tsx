import { Container } from "@/components/common/container";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <Container>
        <p className="flex h-9 items-center justify-center text-center text-xs font-medium tracking-wide sm:text-sm">
          Discover the art of fine fragrance.
        </p>
      </Container>
    </div>
  );
}
