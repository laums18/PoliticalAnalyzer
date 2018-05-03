import json

def expand(dom, domains, depth, parents, look=0):
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
    for c in dom["c"]:
        if domain(dom) not in parents and c != dom['n']:
            tmp = expand(c, domains, depth-1, parents, look - 1)
            res += [[dom["n"]] + x for x in tmp]
    return res

def make_directed(domains):
    nodes = [] 
    links = set()

    for k, v in domains.items():
        nodes.append({"id": k, "group": 0})
        for c in v["c"]:
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
        else:
            domains[dom] = {"c": rec["child_links"], "n": dom}

    for k, v in domains.items():
        domains[k]["c"] = set([x for x in v["c"] if domain(x) != k])
    return domains

def get_directed(recs):
    return make_directed(get_domains(recs))

def get_dendro(recs, depth=2):
    domains = get_domains(recs)
    goods = set([domain(x["parent_url"]) for x in recs if x["depth"] == 0])
    start = {"n": "*You*", "c": goods}
    res = expand(start, domains, depth, [], look=1)
    total = ["#".join(x + [",1\n"]) for x in res]
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


    x = get_dendro(recs, 4)
    print(len(x))
    # start = {"n": "*You*", "c": goods}
    # res = expand(start, domains, 2, [], look=1)
    # print(len(res))
    # for x in res:
    #     print("#".join(x))
