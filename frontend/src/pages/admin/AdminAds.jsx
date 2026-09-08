import AdminCrud from "./AdminCrud";

const AdminAds = () => (
  <AdminCrud
    title="Ads"
    endpoint="/admin/ads"
    defaults={{ title: "", media: "", link: "", placement: "both", active: true }}
    fields={[
      { name: "title", label: "Title", type: "text" },
      { name: "media", label: "Image", type: "image" },
      { name: "link", label: "Link", type: "text" },
      { name: "placement", label: "Placement", type: "text" },
      { name: "active", label: "Active", type: "checkbox" },
    ]}
  />
);
export default AdminAds;
