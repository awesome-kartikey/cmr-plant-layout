import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../contexts/AuthContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

interface ResultItem {
  id: string
  employeeDetails?: { name?: string; employeeCode?: string; photoUrl?: string }
  score?: number
  createdAt?: { toDate: () => Date }
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [results, setResults] = useState<ResultItem[]>([])
  const [filtered, setFiltered] = useState<ResultItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "PlantLayout"))
      const items: ResultItem[] = []
      for (const doc of snap.docs) {
        const details = doc.data()
        const resultsSnap = await getDocs(
          query(collection(doc.ref, "Results"), orderBy("createdAt", "desc"), limit(1))
        )
        resultsSnap.forEach((r) => {
          items.push({ id: r.id, employeeDetails: details as ResultItem["employeeDetails"], ...r.data() })
        })
      }
      setResults(items)
      setFiltered(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!search.trim()) { setFiltered(results); return }
    const q = search.toLowerCase()
    setFiltered(results.filter((r) => {
      const name = (r.employeeDetails?.name || "").toLowerCase()
      const code = (r.employeeDetails?.employeeCode || "").toLowerCase()
      return name.includes(q) || code.includes(q)
    }))
  }, [search, results])

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <LayoutShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{t("employeeTestResults")}</h1>
        </div>

        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                    {(item.employeeDetails?.name || "NA").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.employeeDetails?.name || t("unknownEmployee")}</p>
                    <p className="text-sm text-gray-500">
                      {t("idPrefix", { id: item.employeeDetails?.employeeCode || "N/A" })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {item.score ?? 0}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            {search ? t("noResultsFor", { query: search }) : (
              <>
                <p>{t("noResults")}</p>
                <p className="text-sm">{t("completeTestNote")}</p>
              </>
            )}
          </div>
        )}

        <Button size="lg" className="w-full" onClick={() => navigate("/instructions")}>
          {t("startTest")}
        </Button>
      </div>
    </LayoutShell>
  )
}
