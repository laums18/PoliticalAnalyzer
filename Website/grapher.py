import json

def expand(dom, domains, depth, parents, look=0, lim=99999999):
    if look <= 0:
        if domain(dom) in domains:
            dom = domains[domain(dom)]
        else:
            return [[domain(dom)]]

    if depth == 0:
        return [[dom["n"]]]
    res = []
    parents = parents[:]
    parents.append(dom["n"])

    if look <= 0:
        limit = min(lim, len(dom["c"]))
    else:
        limit = len(dom["c"])

    for c in dom["c"][:limit]:
        if domain(dom) not in parents and c != dom['n']:
            tmp = expand(c, domains, depth-1, parents, look - 1, lim)
            res += [[dom["n"]] + x for x in tmp]
    res += [[dom["n"]]]
    return res


def make_directed(domains):
    nodes = [] 
    links = set()
    tints = ["#E500AC", "#B02BAE", "#7B56B1", "4682B4"]
    for k, v in domains.items():
        nodes.append({"id": k, "group": 0, "color": tints[int(v["depth"])]})
        for c in v["c"]:
            if domain(c) in domains:
                links.add(k + "#" + domain(c))

    json_links = []
    for link in links:
        link = link.split("#")
        json_links.append({"source": link[0], "target": link[1], "value": 1})
    print(len(nodes))
    return {"nodes": nodes, "links": json_links}

def domain(x):
    if "/" in x:
        return x.split("/")[2].replace("www.","")
    else:
        return x

def get_domains(recs):
    domains = {}
    for rec in recs:
        dom = domain(rec["parent_url"])
        if dom in domains:
            domains[dom]["c"] += rec["child_links"]
            domains[dom]["depth"] = min(domains[dom]["depth"], rec["depth"])
        else:
            domains[dom] = {"c": rec["child_links"], "n": dom, "depth": rec["depth"]}

    for k, v in domains.items():
        domains[k]["c"] = list(set([domain(x) for x in v["c"] if domain(x) != k]))
    return domains

def get_directed(recs):
    return make_directed(get_domains(recs))

def get_dendro(recs, depth=2):
    domains = get_domains(recs)
    goods = list(set([domain(x["parent_url"]) for x in recs if x["depth"] == 0]))
    start = {"n": "You", "c": goods}
    res = expand(start, domains, depth, [], look=1, lim=10)
    total = []
    for x in res:
        total.append({"id": "#".join(x), "value": len(x) - 1})
    return total


if __name__ == "__main__":
    # with open("out.dat", "w") as f:
    #   f.write(json.dumps(get_parents()))
    with open("out.dat") as f:
        recs = json.loads(f.read())
    # links = {}
    # for rec in recs:
    #     links[rec["parent_url"]] = rec

    # domains = {}
    # for rec in recs:
    #     dom = domain(rec["parent_url"])
    #     if dom in domains:
    #         domains[dom]["c"] += rec["child_links"]
    #     else:
    #         domains[dom] = {"c": rec["child_links"], "n": dom}

    # for k, v in domains.items():
    #     domains[k]["c"] = set([x for x in v["c"] if domain(x) != k])

    # goods = set([domain(x["parent_url"]) for x in recs if x["depth"] == 0])


    x = get_dendro(recs, 2)
    print(x)
    print(len(x))
    print(len(recs))
    # start = {"n": "*You*", "c": goods}
    # res = expand(start, domains, 2, [], look=1)
    # print(len(res))
    # for x in res:
    #     print("#".join(x))
