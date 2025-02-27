'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DateSelector from './_components/dateSelector';
import { useToast } from "@/components/ui/use-toast";
import { Package, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import './page.css';
import { AddToCart } from '../../Hotels/hoteldetail/_components/AddToCart';
import { useSession } from 'next-auth/react';
import { useUserDeviceType } from '~/services/defineCustomer';
import { useCustomLocale } from '~/context/LocaleProvider';


const AddOn = () => {
  const [addOnProducts, setAddOnProducts] = useState([]);
  const [addonTypes, setAddonTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDates, setSelectedDates] = useState({});
  const [dateOptions, setDateOptions] = useState([]);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const destination = searchParams?.get('destination');
  const service = searchParams?.get('service');

  const { locale: { lang, currency } } = useCustomLocale();

  const { data: session } = useSession();
  let userId = session?.user?.id;
  userId = userId ? userId : 0;

  const userDeviceType = useUserDeviceType();

  const commercialApiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_COMMERCIAL;

  useEffect(() => {
    const searchCriteria = localStorage.getItem('searchCriteria');
    if (searchCriteria) {
      const searchCriteriaObj = JSON.parse(searchCriteria);

      setStartDate(searchCriteriaObj.departureDate);
      setEndDate(searchCriteriaObj.departureDateEnd);

      const dates = generateDateRange(
        searchCriteriaObj.departureDate,
        searchCriteriaObj.departureDateEnd,
      );
      setDateOptions(dates);
    }
  }, []);


  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`${commercialApiUrl}/ancillaries/search?city=${destination}&customerId=${userId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'locale': lang,
              'currency': currency,
            },
          }
        )

        if (response.status === 200) {
          let data = await response.json();
          console.log('show me the data', data);
          data = modifyAddOnData(data);

          setAddOnProducts(data);
          const types = new Set(data.map((product) => product.addOnType));

          setAddonTypes([...types]);
          setLoading(false);
        }
      } catch (error) {
        console.log('error', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [destination]);

  const generateDateRange = (start, end) => {
    const dateArray = [];
    const currentDate = new Date(start);
    const endDt = new Date(end);

    while (currentDate <= endDt) {
      dateArray.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  function modifyAddOnData(data) {
    let modifiedData = Object.keys(data)
      .map((x) => data[x])
      .flat();
    modifiedData.forEach((item) => {
      item.addOnType = item.addon_type;
      delete item.addon_type;
    });

    console.log('modifiedData', modifiedData);
    return modifiedData;
  }

  const handleDateSelect = (productId: string, date: string) => {
    setSelectedDates((prevDates) => ({
      ...prevDates,
      [productId]: date,
    }));
    console.log(`Selected date for product ${productId}: ${date}`);
  };

  console.log('selectedDatesMMM', selectedDates);

  const groupedProducts = addonTypes.map((type) => ({
      type,
      products: addOnProducts.filter((product) => product.addOnType === type),
  }));

  console.log('show me the grouped products', groupedProducts);


  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {loading ? (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-6">
                  <Skeleton className="h-[240px] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            {...fadeInUp}
          >
            Enhance Your Experience
          </motion.h1>

          {groupedProducts.map((group, groupIndex) => (
            <motion.div 
              key={group.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                {group.type === 'Travel Insurance' ? (
                  <Award className="w-6 h-6 text-indigo-600" />
                ) : (
                  <Package className="w-6 h-6 text-indigo-600" />
                )}
                <h2 className="text-2xl font-semibold text-gray-800">
                  {group.type === 'Activity' ? 'Events' : group.type}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.products.map((product) => (
                  <motion.div
                    key={product.product_id}
                    whileHover={{ y: -5 }}
                    className="relative"
                  >
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="p-0">
                        <img
                          src={product.images || product.custom_fields?.image_url}
                          alt={product.name}
                          className="h-[240px] w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                        <p className="text-2xl font-bold text-indigo-600 mb-3">
                          £{product.price || product.custom_fields?.price}
                        </p>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {product.description || product.custom_fields?.description}
                        </p>
                        
                        {group.type === 'Travel Insurance' && (
                          <>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-semibold">Areas Covered:</span>{' '}
                              {product.custom_fields?.region}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                              <span className="font-semibold">Exclusions:</span>{' '}
                              {product.custom_fields?.exclusions}
                            </div>
                          </>
                        )}

                        {group.type === 'Activity' && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">Select Date</span>
                            </div>
                            <DateSelector
                              availableDates={dateOptions}
                              selectedDate={selectedDates[product.id]}
                              onDateSelect={(date) => handleDateSelect(product.id, date)}
                            />
                          </div>
                        )}

                        <div className="mt-4">
                          <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => {
                              toast({
                                title: "Added to Cart",
                                description: `${product.name} has been added to your cart.`,
                              });
                            }}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddOn;
