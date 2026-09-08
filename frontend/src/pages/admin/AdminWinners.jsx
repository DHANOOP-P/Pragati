import AdminCrud from "./AdminCrud";

const AdminWinners = () => (
  <AdminCrud
    title="Winners"
    endpoint="/admin/winners"
    defaults={{ eventTitle: "", studentName: "", position: "First", department: "", published: true }}
    fields={[
      { name: "eventTitle", label: "Event", type: "text" },
      { name: "studentName", label: "Student", type: "text" },
      { name: "position", label: "Position", type: "text" },
      { name: "department", label: "Department", type: "text" },
      { name: "published", label: "Published", type: "checkbox" },
    ]}
  />
);
export default AdminWinners;
