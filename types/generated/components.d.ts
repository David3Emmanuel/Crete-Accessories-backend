import type { Schema, Struct } from '@strapi/strapi';

export interface OrderDeliveryAddress extends Struct.ComponentSchema {
  collectionName: 'components_order_delivery_addresses';
  info: {
    displayName: 'Delivery Address';
    icon: 'map-marker';
  };
  attributes: {
    address: Schema.Attribute.String & Schema.Attribute.Required;
    city: Schema.Attribute.String & Schema.Attribute.Required;
    fullName: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    state: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductSpecification extends Struct.ComponentSchema {
  collectionName: 'components_product_specifications';
  info: {
    displayName: 'Specification';
    icon: 'list';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductVariant extends Struct.ComponentSchema {
  collectionName: 'components_product_variants';
  info: {
    displayName: 'Variant';
    icon: 'paint-brush';
  };
  attributes: {
    colorHex: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'order.delivery-address': OrderDeliveryAddress;
      'product.specification': ProductSpecification;
      'product.variant': ProductVariant;
    }
  }
}
