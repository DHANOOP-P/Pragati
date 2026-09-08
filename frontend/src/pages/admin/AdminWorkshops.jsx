import AdminCrud from "./AdminCrud";

const AdminWorkshops = () => (
  <AdminCrud
    title="Workshops"
    endpoint="/admin/workshops"
    defaults={{ title: "", description: "", date: "", venue: "GEC Wayanad", image: "", mentor: "", capacity: 30, isOpen: true, price: 299 }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "mentor", label: "Mentor", type: "text" },
      { name: "date", label: "Date", type: "datetime" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "image", label: "Image", type: "image" },
      { name: "price", label: "Price", type: "number" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "isOpen", label: "Open", type: "checkbox" },
    ]}
  />
);
export default AdminWorkshops;
