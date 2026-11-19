import { ButtonLink } from "@/components/button";
import { MessageScreen } from "@/components/message-screen";
import { routes } from "@/config/routes";
import { getTranslations } from "@/i18n/locale";

export default async function NotFound() {
  const copy = (await getTranslations()).errorPage;
  return (
    <main>
      <title>{copy.notFoundTitle}</title>
      <MessageScreen
        fullPage
        title={copy.notFoundTitle}
        body={copy.notFoundBody}
        actions={
          <ButtonLink href={routes.app.home} size="lg">
            {copy.home}
          </ButtonLink>
        }
      />
    </main>
  );
}
