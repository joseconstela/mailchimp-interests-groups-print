mc-print
========

Prints all MailChimp's ids and names for all subscribers lists groups of interests.

https://kb.mailchimp.com/lists/groups/getting-started-with-groups

This node.js script uses the serverless framework. - https://serverless.com

    $ sls invoke local --function print --stage production

    [
      {
        "id": "xxxxxxx",
        "web_id": xxxxxxx,
        "name": "Master List",
        "categories": [
          "xxxxxxx - Pro version users",
          "xxxxxxx - Premium users",
          "xxxxxxx - Free version users",
        ]
      },
      {
        "id": "xxxxxxx",
        "web_id": xxxxxxx,
        "name": "Development List",
        "categories": []
      }
    ]
