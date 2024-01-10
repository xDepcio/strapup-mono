import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import ChangeVisibilityBtn from "@/components/ChangeVisibility"
import DeleteTemplate from "@/components/DeleteTemplate"
import { Button } from "@/components/ui/button"
import { DBQuery } from "@/db/db"
import { DbTemplte } from "@/db/types"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { FaEdit, FaRegStar } from "react-icons/fa"
import { MdOutlineSdStorage } from "react-icons/md"
import { Merge } from 'type-fest'

export default async function UserPage({ children }: { children: React.ReactNode }) {
    const user = await getServerSession(authOptions)
    if (!user) {
        return redirect('/')
    }
    console.log('userts', user)

    const { rows, rowCount } = await DBQuery<Merge<Pick<DbTemplte, 'id' | 'name' | 'public' | 'tags'>, { stars: number }>>(`
        SELECT
        t.id,
        t.name,
        t.public,
        t.owner_id,
        t.tags,
        t.synced,
        COUNT(uts.template_id) AS stars
    FROM
        templates AS t
    LEFT JOIN
        user_template_stars AS uts ON t.id = uts.template_id
    WHERE
        t.owner_id = $1
    GROUP BY
        t.id,
        t.name,
        t.public,
        t.owner_id,
        t.tags,
        t.synced
    ORDER BY stars DESC;
    `, [user.user.id])

    if (rowCount === 0) {
        // console.log(res)
        return <div>error</div>
    }
    // const templates = res.data
    const templates = rows

    // const templates: DbTemplte[] = [
    //     {
    //         id: 1,
    //         name: 'Template 1',
    //         owner_id: 1,
    //         public: true,
    //         stars: 1,
    //         tags: 'tag1 tag2',
    //         synced: true,
    //     },
    //     {
    //         id: 2,
    //         name: 'Template 2',
    //         owner_id: 1,
    //         public: true,
    //         stars: 1,
    //         tags: 'tag1 tag2',
    //         synced: true,
    //     },
    //     {
    //         id: 3,
    //         name: 'Template 3',
    //         owner_id: 1,
    //         public: true,
    //         stars: 1,
    //         tags: 'tag1 tag2',
    //         synced: true,
    //     },
    //     {
    //         id: 4,
    //         name: 'Template 4',
    //         owner_id: 1,
    //         public: true,
    //         stars: 1,
    //         tags: 'tag1 tag2',
    //         synced: true,
    //     },
    //     {
    //         id: 5,
    //         name: 'Template 5',
    //         owner_id: 1,
    //         public: true,
    //         stars: 1,
    //         tags: 'tag1 tag2',
    //         synced: true,
    //     },
    //     {
    //         id: 6,
    //         name: 'Template 6',
    //         owner_id: 1,
    //         public: true,
    //         stars: 1,
    //         tags: 'tag1 tag2',
    //         synced: true,
    //     },
    // ]

    return (
        <div className="flex flex-col gap-2 dark:bg-zinc-900 bg-zinc-50 rounded-lg p-4 border">
            {templates.map((template) => (
                <div key={template.name} className="flex border-b">
                    <div className="flex gap-4 flex-col justify-center dark:border-zinc-800 border-zinc-200 p-4">
                        <div className="flex items-center gap-2">
                            <Link href={`/templates/${template.id}`}>
                                <h4 className="cursor-pointer hover:underline scroll-m-20 text-lg font-semibold tracking-tight">{template.name}</h4>
                            </Link>
                            <div className="w-fit bg-indigo-200 flex items-center gap-1 rounded-full px-2 py-[2px] text-xs text-indigo-800">
                                <MdOutlineSdStorage />
                                <p>template</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs bg-yellow-200 px-2 py-[2px] rounded-full text-yellow-800">
                                <FaRegStar />
                                <p className="">{template.stars}</p>
                            </div>
                        </div>
                        <p className="text-ellipsis overflow-hidden line-clamp-2 max-w-[60ch]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora aut non cupiditate porro in! Laborum repellendus, molestias enim voluptatibus doloribus nulla corrupti iure quod perferendis maiores? Impedit laborum in odit!</p>
                        <div className="flex gap-2">
                            {template.tags.split(' ').map((tag, i) => (
                                <Link href={{ pathname: '/search', query: { keyword: tag } }} className="dark:bg-zinc-800 bg-zinc-200 px-2 py-[2px] rounded-md text-sm"
                                    key={i}>
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="text-muted-foreground text-sm items-start flex flex-col">
                        <ChangeVisibilityBtn template={template as DbTemplte} changeWhat="template" toPublic={!template.public} />

                        <Button disabled className="flex items-center gap-2" variant={'ghost'}>
                            <p>Edit</p>
                            <FaEdit />
                        </Button>
                        <DeleteTemplate template={template as DbTemplte} />

                    </div>
                </div>
            ))}
        </div>
    )
}
