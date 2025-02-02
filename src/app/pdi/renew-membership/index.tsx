import { RenewMembershipForm } from './client';

export const RenewMembership = async ({
  student_id,
  student_name,
}: {
  student_id: string;
  student_name: string;
}) => {
  return (
    <RenewMembershipForm student_id={student_id} student_name={student_name} />
  );
};
