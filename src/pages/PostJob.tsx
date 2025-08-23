import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const PostJob = () => {
    const [searchParams] = useSearchParams();
    const initialCountry = searchParams.get('country') || 'GB';
    const initialLocation = searchParams.get('postcode') || '';
    const [form, setForm] = useState({ country: initialCountry, location: initialLocation });

    useEffect(() => {
      setForm({ country: initialCountry, location: initialLocation });
    }, [initialCountry, initialLocation]);

    console.log('show me form', form);


    return (
        <>
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 100px)' }} className="flex items-center justify-center">
                <h1>Post Job</h1>
                <p>Post a job to the platform</p>
            </div>
            <Footer />
        </>
    );
};

export default PostJob;