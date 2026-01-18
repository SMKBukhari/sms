import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../ui/empty";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  content?: React.ReactNode;
}

const EmptyState = ({ icon, title, description, content }: EmptyStateProps) => {
  return (
    <Empty>
      <EmptyHeader>
        <div>{icon}</div>
        <EmptyTitle className='font-semibold'>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{content}</EmptyContent>
    </Empty>
  );
};

export default EmptyState;
