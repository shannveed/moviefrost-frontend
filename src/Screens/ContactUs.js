import React from 'react'
import Layout from '../Layout/Layout';
import Head from '../Components/Head';
import { FiPhoneCall, FiMail, FiMapPin } from 'react-icons/fi';

function ContactUs() {
    const ContactData = [
        {
          id: 1,
          title: 'Email Us',
          info: 'Interactively grow backend ideas for cross-platform models.',
          icon: FiMail,
          contact: 'shannaveed50@gmail.com',
        },
        {
          id: 2,
          title: 'Call Us',
          info: 'Distinctively exploit optimal alignments for intuitive bandwidth.',
          icon: FiPhoneCall,
          contact: '+9714-2261242',
        },
        {
          id: 3,
          title: 'Location',
          info: 'Dubai, UAE',
          icon: FiMapPin,
          contact: '',
        },
      ];
      
  return (
    <Layout>
      <div className="min-height-screen container mx-auto px-2 my-6">
        <Head title="Contact Us" />
    
          <div className="grid mg:grid-cols-2 gap-6 lg:my-20  lg:grid-cols-3 xl:gap-8">
          {ContactData.map((item) => (
            <div
                key={item.id}
                className="border border-border flex-colo p-10 bg-dry rounded-lg text-center"
            >
                <span className="flex-colo w-20 h-20 mb-4 rounded-full bg-main text-customPurple text-2xl">
                <item.icon />
                </span>
                <h5 className="text-xl font-semibold mb-2">{item.title}</h5>
                <p className="mb-0 text-sm text-text leading-7">
                <a href={`mailto:${item.contact}`} className="text-blue-600"> 
                    {item.contact}
                     </a>{' '} 
                     {item.info}
               </p> 
            </div>
            ))}
          </div>
       
      </div>
    </Layout>
  );
}

export default ContactUs