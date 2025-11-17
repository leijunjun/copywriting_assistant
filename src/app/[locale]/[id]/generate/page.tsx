import GenerateContent from '@/components/page/generate-content';

type Props = {
  params: { id: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function GeneratePage({ params, searchParams }: Props) {
  return <GenerateContent params={params} searchParams={searchParams} />;
}

