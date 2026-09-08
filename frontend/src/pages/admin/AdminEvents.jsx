import AdminCrud from "./AdminCrud";

const AdminEvents = () => (
  <AdminCrud
    title="Arts"
    endpoint="/admin/events"
    defaults={{ title: "", description: "", date: "", venue: "GEC Wayanad", image: "", category: "Stage", stage: "onstage", participationType: "individual", capacity: 60, isOpen: true, price: 0 }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "stage", label: "Stage", type: "select", options: ["onstage", "offstage"] },
      { name: "participationType", label: "Group / Individual", type: "select", options: ["group", "individual"] },
      { name: "date", label: "Date", type: "datetime" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "image", label: "Image", type: "image" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "isOpen", label: "Open", type: "checkbox" },
    ]}
  />
);
export default AdminEvents;
