import AdminCrud from "./AdminCrud";

const AdminProshows = () => (
  <AdminCrud
    title="Proshow"
    endpoint="/admin/proshows"
    defaults={{ title: "", description: "", date: "", venue: "Open Stage", image: "", artist: "", capacity: 800, isOpen: true, price: 499 }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "artist", label: "Artist", type: "text" },
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
export default AdminProshows;
