'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Link from 'next/link';
import './page.css';
import { AddToCart } from '../../Hotels/hoteldetail/_components/AddToCart';
import { useSession } from 'next-auth/react';
import { useUserDeviceType } from '~/services/defineCustomer';
import DateSelector from './_components/dateSelector';
import { useCustomLocale } from '~/context/LocaleProvider';


const AddOn = () => {
  const [addOnProducts, setAddOnProducts] = useState([]);
  const [addonTypes, setAddonTypes] = useState([]);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDates, setSelectedDates] = useState({});
  const [dateOptions, setDateOptions] = useState([]);

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

  const handleDateSelect = (productId, event) => {
    const newDate = event.target.value;
    console.log('the new date', newDate);
    setSelectedDates((prevDates) => ({
      ...prevDates,
      [productId]: newDate, // Maps the product ID to the new date
    }));
    console.log(`Selected date for product ${productId}: ${newDate}`);
  };

  console.log('selectedDatesMMM', selectedDates);

  const groupedProducts = addonTypes.map((type) => ({
      type,
      products: addOnProducts.filter((product) => product.addOnType === type),
  }));

  console.log('show me the grouped products', groupedProducts);


  return (
    <>
      {loading ? (
        <div className="addon-spinner w-screen">
          <CircularProgress />
        </div>
      ) : (
        <div style={{ minHeight: '54vh' }} className="addon-title-div ">
          <h1 className="addon-title">Choose your extras....</h1>

          {groupedProducts.map((group, index) =>
            group.type === 'Travel Insurance' ? (
              <div key={group.type}>
                {index > 0 && <hr className="addon-vertical-lign" />}
                <h2 className="addon-group-title">{group.type}</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {group.products.map((product) => (
                    <div
                      key={product.product_id}
                      className="relative h-[440px] rounded-lg bg-white p-6 shadow-md"
                    >
                      <img
                        className="card-div-img"
                        src={product.custom_fields.image_url}
                        alt={product.custom_fields.name}
                      />
                      <h3 className="mt-2 text-lg font-bold">{product.custom_fields.name}</h3>
                      <p className="font-bold">£{product.custom_fields.price}</p>
                      <p className="truncatewords mt-2 text-sm">
                        {product.custom_fields.description}
                      </p>
                      <p className="card-div-text mt-2">
                        <span className="font-bold">Areas Covered:</span>{' '}
                        {product.custom_fields.region}
                      </p>
                      <p className="card-div-text mt-2">
                        <span className="font-bold">Exclusions:</span>{' '}
                        {product.custom_fields.exclusions}
                      </p>

                      <div className="card-div-add-to-cart-button">
                        <AddToCart
                          payload={{
                            customItems: [
                              {
                                sku: product?.id,
                                name: product?.name,
                                quantity: 1,
                                list_price: product?.price,
                                entity_name: 'ancillary',
                              },
                            ],
                          }}
                          buttonStyle={{ color: 'white' }}
                          containerStyle={{
                            backgroundColor: '#374151',
                            width: '100px',
                            textAlign: 'center',
                            padding: '6px 1px',
                          }}
                          buttonText={'Select'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div key={group.type}>
                {index > 0 && <hr className="addon-vertical-lign" />}
                <h2 style={{ display: 'inline-block' }} className="addon-group-title">
                  {group.type === 'Activity' ? 'Events' : group.type}
                </h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {group.products.map((product) => (
                    <div
                      key={product?.product_id}
                      className="relative h-[440px] rounded-lg bg-white p-6 shadow-md"
                    >
                      <img className="card-div-img" src={product?.images} alt={product?.name} />
                      <h3 className="mt-2 text-lg font-bold">{product?.name}</h3>
                      <p className="font-bold">£{product?.price}</p>
                      <p className="truncatewords mt-3 text-sm">{product?.description}</p>

                      <div className="card-div-add-to-cart-button">
                        <AddToCart
                          payload={{
                            customItems: [
                              {
                                sku: product?.id,
                                name: product?.name,
                                quantity: 1,
                                list_price: product?.price,
                                date: selectedDates[product.id],
                                entity_name: 'ancillary',
                              },
                            ],
                            bookingChannelId: userDeviceType,
                          }}
                          buttonStyle={{ color: 'white' }}
                          containerStyle={{
                            backgroundColor: '#374151',
                            width: '100px',
                            textAlign: 'center',
                            padding: '6px 1px',
                          }}
                          buttonText={'Select'}
                        />
                      </div>
                      {group.type === 'Activity' && (
                        <div style={{ width: '26%' }} className="mt-2">
                          <DateSelector
                            availableDates={dateOptions}
                            selectedDate={selectedDates[product.id]}
                            onDateSelect={(e) => handleDateSelect(product.id, e)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          <div className="mt-5 flex justify-center">
            <Link href={`/${lang}/login?service=${service}`}>
              <Button
                className="font-bold"
                variant="contained"
                sx={{
                  backgroundColor: '#333',
                  textTransform: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                Continue
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

AddOn.displayName = 'AddOn';

export default AddOn;