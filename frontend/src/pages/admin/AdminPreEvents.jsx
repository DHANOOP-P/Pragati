import AdminCrud from "./AdminCrud";

const AdminPreEvents = () => (
  <AdminCrud
    title="Pre events"
    endpoint="/admin/preevents"
    defaults={{
      title: "",
      description: "",
      date: "",
      venue: "GEC Wayanad",
      image: "",
      category: "Campus",
      isOpen: true,
    }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "date", label: "Date", type: "datetime" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "image", label: "Image", type: "image" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "isOpen", label: "Listed", type: "checkbox" },
    ]}
  />
);

export default AdminPreEvents;
