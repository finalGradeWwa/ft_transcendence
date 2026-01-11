import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import ReactMarkdown from 'react-markdown';

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>;
}

async function getPrivacyContent(locale: string) {
  const filePath = path.join(
    process.cwd(),
    'content/privacy-policy',
    `${locale}.md`
  );
  try {
    if (!fs.existsSync(filePath)) return null;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/^(\d+[\.\)])/gm, '\n\n**$1**');
    return content;
  } catch {
    return null;
  }
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  const content = await getPrivacyContent(locale);

  if (!content) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <Navigation />

      <div className="py-12 flex justify-center" id="main-content">
        <div className="bg-dark-bg/80 min-[600px]:bg-dark-bg/50 backdrop-blur-md p-6 sm:p-12 rounded-xl shadow-2xl w-full border border-primary-green/50">
          <article
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            lang={locale}
            className="prose prose-sm min-[600px]:prose-base max-w-none break-words
            prose-headings:text-light-bg prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-center
            prose-a:text-primary-green prose-a:no-underline hover:prose-a:underline focus:prose-a:ring-2 focus:prose-a:ring-primary-green focus:outline-none
            prose-h1:text-xl min-[600px]:prose-h1:text-3xl prose-h1:mt-2 prose-h1:mb-8
            prose-h2:font-black prose-h2:text-secondary-beige prose-h2:text-xl min-[600px]:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-light-bg prose-p:leading-relaxed prose-p:my-4
            prose-ul:marker:text-secondary-beige prose-ul:marker:font-black prose-ul:my-4
            prose-ol:marker:text-secondary-beige prose-ol:marker:font-black prose-ol:font-black prose-ol:my-4
            prose-strong:text-secondary-beige prose-strong:font-black
            prose-li:text-light-bg prose-li:my-2 prose-li:leading-relaxed
            prose-hr:border-secondary-beige/30 prose-hr:my-6"
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
