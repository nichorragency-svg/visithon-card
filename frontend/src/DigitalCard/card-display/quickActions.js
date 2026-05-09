import { FaEnvelope, FaGlobe, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { locationHref, withHttp } from './helpers';

export function buildQuickActions(user, phoneDigits) {
  return [
    {
      key: 'call',
      label: 'Call',
      Icon: FaPhoneAlt,
      href: phoneDigits ? `tel:${phoneDigits}` : '',
      on: phoneDigits.length > 0,
    },
    {
      key: 'email',
      label: 'Email',
      Icon: FaEnvelope,
      href: user.email ? `mailto:${user.email}` : '',
      on: !!user.email?.trim(),
    },
    {
      key: 'web',
      label: 'Website',
      Icon: FaGlobe,
      href: withHttp(user.website),
      on: !!user.website?.trim(),
    },
    {
      key: 'loc',
      label: 'Location',
      Icon: FaMapMarkerAlt,
      href: locationHref(user),
      on: !!(user.location_text || user.locationUrl || '').trim(),
    },
  ];
}
