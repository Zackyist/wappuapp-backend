import _ from 'lodash';
import * as eventCore from '../core/event-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';

const addEvent = createJsonRoute(function(req, res) {
  const event = {
    code: 'asd2',
    name: req.body.name,
    location_name: req.body.location_name,
    description: req.body.description,
    organizer: req.body.organizer,
    contact_details: req.body.contact_details,
    teemu: req.body.teemu,
    city_id: req.body.city_id,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    cover_image: req.body.cover_image,
    fb_event_id: req.body.fb_event_id
  };
  return eventCore.addEvent(event)
  .then(result => {
    if (result.rowCount !== 1) {
      throwStatus(422, 'Event creation failed');
    } else {
      return;
    }
  })
  .catch(err => {
    return err;
  });
});

const updateEvent = createJsonRoute(function(req, res) {
  const event = {
    id: req.body.id,
    code: req.body.code,
    name: req.body.name,
    location_name: req.body.location_name,
    description: req.body.description,
    organizer: req.body.organizer,
    contact_details: req.body.contact_details,
    teemu: req.body.teemu,
    city_id: req.body.city_id,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    cover_image: req.body.cover_image,
    fb_event_id: req.body.fb_event_id
  };
  return eventCore.updateEvent(event)
  .then(result => {
      return;
    })
  .catch(err => {
    return err;
  });
});

const deleteEvent = createJsonRoute(function(req, res) {
    return eventCore.deleteEvent(req.params.id)
});

const getEvent = createJsonRoute(function(req, res) {
  return eventCore.getEventById({
    eventId: req.params.id,
    client:  req.client
  })
  .then(event => {
    if (!event) {
      throwStatus(404, 'No such event id');
    } else {
      return event;
    }
  });
});

const getEvents = createJsonRoute(function(req, res) {
  const eventParams = assert({
    id: req.params.id,
    city: req.query.cityId,
    showPast: req.query.showPast,
  }, 'eventsParams');

  const coreParams = _.merge(eventParams, {
    client: req.client,
  });

  return eventCore.getEvents(coreParams).then(results => {
    if (req.params.id !== undefined) {
      if (results.length > 1) {
        throw new Error('Unexpected number of rows');
      } else if (results.length === 0) {
        throwStatus(404, 'No such event id');
      } else {
        return results[0];
      }
    } else {
      // Respond with an array of objects otherwise.
      return results;
    }
  });
});

function isValidCheckIn(action) {
  return eventCore.isValidCheckIn(action);
};

export {
  getEvent,
  getEvents,
  isValidCheckIn,
  addEvent,
  deleteEvent,
  updateEvent
};
