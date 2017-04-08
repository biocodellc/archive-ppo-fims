# -*- coding: utf-8 -*-

import sys, argparse
import requests
from requests_toolbelt import MultipartEncoder, MultipartEncoderMonitor

AUTH_URL = "authenticationService/login"
UPLOAD_URL = "upload"


def upload(rest_root, project_id, expedition_code, triples_file, username, password, is_public=False,
           create_expedition=False):
    rest_root = __sanitize_url(rest_root)

    session = requests.Session()

    # Authenticate #
    auth_r = session.post(rest_root + AUTH_URL, data={
        'username': username,
        'password': password
    })

    if auth_r.status_code > 299:
        __print_error(auth_r)

    # Upload #
    with open(triples_file, 'rb') as f:
        e = MultipartEncoder({
            'triplesFile': (triples_file, f, "application/octet-stream"),
            'projectId': project_id,
            'expeditionCode': expedition_code,
            'create': str(create_expedition),
            'public': str(is_public),
        })

        headers = {'Content-Type': e.content_type}
        r = session.post(rest_root + UPLOAD_URL,
                         allow_redirects=False,
                         headers=headers,
                         data=e)

        if r.status_code > 299:
            __print_error(r)

        print(r.json())


def __sanitize_url(url):
    """add a trailing slash to the url if not present"""
    if not url.endswith("/"):
        url += "/"
    return url


def __print_error(r):
    print('status code: %s' % r.status_code)
    print(r.json()['usrMessage'] or 'Server Error')
    sys.exit()


def main():
    parser = argparse.ArgumentParser(
        description="PPO-FIMS cmd line data uploader.",
        epilog="As an alternative to the commandline, params can be placed in a file, one per line, and specified on the commandline like '%(prog)s @params.conf'.",
        fromfile_prefix_chars='@')
    parser.add_argument(
        "--rest_service",
        help="location of the FIMS REST services",
        default="http://www.plantphenology.org/rest/",
        dest="rest_service",
    )
    parser.add_argument(
        "project_id",
        help="project_id to upload to",
    )
    parser.add_argument(
        "expedition_code",
        help="expedition_code to upload the dataset to",
    )
    parser.add_argument(
        "triples_file",
        help="the triples_file to upload",
    )
    parser.add_argument(
        "--public",
        help="make the expedition public when creating. defaults to false",
        dest="is_public",
        action="store_true")
    parser.add_argument(
        "--create",
        help="if the expedition doesn't exist, create a new expedition.",
        action="store_true",
        dest="create_expedition")
    parser.add_argument(
        "-u",
        "--username",
        required=True,
        help="username",
        dest="username")
    parser.add_argument(
        "-p",
        "--password",
        required=True,
        help="password",
        dest="password")
    args = parser.parse_args()

    upload(args.rest_service, args.project_id, args.expedition_code, args.triples_file, args.username, args.password,
           args.is_public, args.create_expedition)


if __name__ == '__main__':
    main()
