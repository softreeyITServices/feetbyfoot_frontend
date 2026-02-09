export default function AccountContent() {
  return (
    <section className="border rounded-md p-6">
      <p className="text-sm">
        Hello <strong>6osxtkc39x</strong>{" "}
        <span className="text-gray-500">
          (not 6osxtkc39x?
          <a href="#" className="text-blue-600 ml-1">
            Log out
          </a>
          )
        </span>
      </p>

      <div className="mt-6 border-t pt-4 text-sm text-gray-600 leading-relaxed">
        <p>
          From your account dashboard you can view your recent orders,
          manage your shipping and billing addresses, and edit your
          password and account details.
        </p>
      </div>
    </section>
  );
}
