import Navbar from "@/component/common/navbar";
import AccountSidebar from "@/component/account/AccountSidebar";
import Footer from "@/component/common/Footer";
import AccountContent from "@/component/account/AccountContent";

export default function AccountPage() {
    return (
        <>
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-semibold">My Account</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
                    <AccountSidebar />
                    <AccountContent />
                </div>
            </main>
            <Footer />
        </>
    );
}
