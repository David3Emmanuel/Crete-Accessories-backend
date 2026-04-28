import type { Core } from '@strapi/strapi'

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: { folder: env('CLOUDINARY_FOLDER') },
        uploadStream: { folder: env('CLOUDINARY_FOLDER') },
        delete: {},
      },
    },
  },
})

export default config
